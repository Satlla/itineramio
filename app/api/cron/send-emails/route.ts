import { NextRequest, NextResponse } from 'next/server'
import { processScheduledEmails } from '../../../../src/lib/email-sequences'

/**
 * Cron job para procesar y enviar emails programados
 * Se ejecuta cada 15 minutos en Vercel Cron
 */
export async function GET(req: NextRequest) {
  try {
    console.log('[CRON] Starting email processing job...')

    // Verificar autorización (Vercel Cron incluye header especial)
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.error('[CRON] Unauthorized request')
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Procesar emails programados
    const result = await processScheduledEmails(100) // Procesar hasta 100 emails por ejecución

    console.log('[CRON] Email processing completed:', result)

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('[CRON] Error processing emails:', error)

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
