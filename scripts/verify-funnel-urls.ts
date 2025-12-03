/**
 * Script para verificar todos los endpoints del embudo
 */

const urls = [
  // Landing
  { name: 'Landing Page', url: 'http://localhost:3000/' },

  // Test
  { name: 'Test de Personalidad', url: 'http://localhost:3000/host-profile/test' },

  // Lead Magnets
  { name: 'Lead Magnet: Estratega', url: 'http://localhost:3000/recursos/estratega-5-kpis' },
  { name: 'Lead Magnet: Sistemático', url: 'http://localhost:3000/recursos/sistematico-47-tareas' },
  { name: 'Lead Magnet: Diferenciador', url: 'http://localhost:3000/recursos/diferenciador-storytelling' },
  { name: 'Lead Magnet: Ejecutor', url: 'http://localhost:3000/recursos/ejecutor-modo-ceo' },
  { name: 'Lead Magnet: Resolutor', url: 'http://localhost:3000/recursos/resolutor-27-crisis' },
  { name: 'Lead Magnet: Experiencial', url: 'http://localhost:3000/recursos/experiencial-corazon-escalable' },
  { name: 'Lead Magnet: Equilibrado', url: 'http://localhost:3000/recursos/equilibrado-versatil-excepcional' },
  { name: 'Lead Magnet: Improvisador', url: 'http://localhost:3000/recursos/improvisador-kit-anti-caos' },

  // PDFs
  { name: 'PDF: Estratega', url: 'http://localhost:3000/downloads/estratega-5-kpis.pdf' },
  { name: 'PDF: Sistemático', url: 'http://localhost:3000/downloads/sistematico-47-tareas.pdf' },
  { name: 'PDF: Diferenciador', url: 'http://localhost:3000/downloads/diferenciador-storytelling.pdf' },
  { name: 'PDF: Ejecutor', url: 'http://localhost:3000/downloads/ejecutor-modo-ceo.pdf' },
  { name: 'PDF: Resolutor', url: 'http://localhost:3000/downloads/resolutor-27-crisis.pdf' },
  { name: 'PDF: Experiencial', url: 'http://localhost:3000/downloads/experiencial-corazon-escalable.pdf' },
  { name: 'PDF: Equilibrado', url: 'http://localhost:3000/downloads/equilibrado-versatil-excepcional.pdf' },
  { name: 'PDF: Improvisador', url: 'http://localhost:3000/downloads/improvisador-kit-anti-caos.pdf' },

  // Blog - Artículos de automatización
  { name: 'Blog: Mensajes Automáticos Airbnb', url: 'http://localhost:3000/blog/mensajes-automaticos-airbnb' },
  { name: 'Blog: Mensajes Automáticos Booking', url: 'http://localhost:3000/blog/mensajes-automaticos-booking' },
]

async function checkUrl(url: string): Promise<number> {
  try {
    const response = await fetch(url)
    return response.status
  } catch (error) {
    return 0
  }
}

async function verifyAll() {
  console.log('🔍 VERIFICACIÓN DEL EMBUDO COMPLETO\n')
  console.log('='.repeat(80))

  for (const { name, url } of urls) {
    const status = await checkUrl(url)
    const icon = status === 200 ? '✅' : status === 404 ? '❌' : '⚠️'
    const statusText = status === 200 ? 'OK' : status === 404 ? 'NOT FOUND' : `ERROR (${status})`

    console.log(`${icon} ${name.padEnd(40)} → ${statusText}`)
  }

  console.log('\n' + '='.repeat(80))
  console.log('\n✨ Verificación completada\n')
}

verifyAll()
