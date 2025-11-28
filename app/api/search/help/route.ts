import { NextRequest, NextResponse } from 'next/server'
import { HELP_CONTENT, HelpContent } from '../../../../src/data/help-content'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')?.toLowerCase().trim()

    if (!query || query.length < 2) {
      return NextResponse.json({
        results: [],
        total: 0,
        query: query || ''
      })
    }

    // Buscar en todos los campos del contenido
    const results = HELP_CONTENT.filter((item) => {
      const searchText = `${item.title} ${item.description} ${item.content} ${item.tags.join(' ')}`.toLowerCase()
      return searchText.includes(query)
    })

    // Calcular relevancia (simple scoring)
    const scoredResults = results.map((item) => {
      let score = 0

      // Mayor peso si está en el título
      if (item.title.toLowerCase().includes(query)) score += 10

      // Peso medio si está en la descripción
      if (item.description.toLowerCase().includes(query)) score += 5

      // Menor peso si está en tags
      if (item.tags.some(tag => tag.toLowerCase().includes(query))) score += 3

      // Peso mínimo si está en el contenido
      if (item.content.toLowerCase().includes(query)) score += 1

      return { ...item, score }
    })

    // Ordenar por relevancia
    const sortedResults = scoredResults.sort((a, b) => b.score - a.score)

    // Agrupar por tipo
    const grouped = sortedResults.reduce((acc, item) => {
      const type = item.type
      if (!acc[type]) {
        acc[type] = []
      }
      acc[type].push(item)
      return acc
    }, {} as Record<string, HelpContent[]>)

    return NextResponse.json({
      results: sortedResults.slice(0, 10), // Limitar a 10 resultados top
      grouped,
      total: sortedResults.length,
      query
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Error en la búsqueda' },
      { status: 500 }
    )
  }
}
