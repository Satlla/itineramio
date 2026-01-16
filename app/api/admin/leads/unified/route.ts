import { NextRequest, NextResponse } from 'next/server'
import { getAllUnifiedLeads } from '@/lib/unified-lead'
import { requireAdminAuth } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as 'cold' | 'warm' | 'hot' | null
    const hasQuiz = searchParams.get('hasQuiz') === 'true'

    const leads = await getAllUnifiedLeads({
      status: status || undefined,
      hasQuiz: hasQuiz || undefined,
      limit: 200
    })

    // Calculate stats
    const stats = {
      total: leads.length,
      hot: leads.filter(l => l.metadata.status === 'hot').length,
      warm: leads.filter(l => l.metadata.status === 'warm').length,
      cold: leads.filter(l => l.metadata.status === 'cold').length,
      withQuiz: leads.filter(l => l.metadata.completed.quiz).length,
      withForm: leads.filter(l => l.metadata.completed.plantillasForm).length,
      withCalculator: leads.filter(l => l.metadata.completed.calculator).length
    }

    return NextResponse.json({ leads, stats })
  } catch (error) {
    console.error('Error fetching unified leads:', error)
    return NextResponse.json({ error: 'Error fetching leads' }, { status: 500 })
  }
}
