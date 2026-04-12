import { NextRequest, NextResponse } from 'next/server'
import { processOnboardingEmails } from '@/lib/onboarding-emails'

/**
 * POST /api/cron/onboarding
 *
 * Cron job que evalúa el estado de cada usuario activo
 * y envía el email de onboarding que corresponda.
 *
 * Schedule: cada hora (0 * * * *)
 * Configurado en vercel.json
 */
export async function POST(req: NextRequest) {
  try {
    // Verificar que viene del cron de Vercel
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const results = await processOnboardingEmails()

    return NextResponse.json({
      success: true,
      data: {
        processed: results.processed,
        sent: results.sent,
        errors: results.errors,
        details: results.details,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error processing onboarding emails' },
      { status: 500 }
    )
  }
}

// También permitir GET para testing manual
export async function GET(req: NextRequest) {
  return POST(req)
}
