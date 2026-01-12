/**
 * Script para corregir tildes y ñ que faltan en textos en español
 * Ejecutar con: npx tsx scripts/fix-spanish-accents.ts
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

// Mapeo de palabras incorrectas a correctas
const corrections: Record<string, string> = {
  // Palabras con ñ
  'ano': 'año',
  'anos': 'años',
  'espana': 'España',
  'espanol': 'español',
  'manana': 'mañana',
  'companero': 'compañero',
  'companeros': 'compañeros',
  'resenas': 'reseñas',
  'resena': 'reseña',
  'dueno': 'dueño',
  'duenos': 'dueños',
  'pequeno': 'pequeño',
  'pequenos': 'pequeños',
  'pequena': 'pequeña',
  'pequenas': 'pequeñas',
  'ensenamos': 'enseñamos',
  'ensenarte': 'enseñarte',
  'suenos': 'sueños',

  // Palabras con tilde en á
  'mas': 'más',  // Careful: only when it means "more", not "but"
  'dias': 'días',
  'dia': 'día',
  'ademas': 'además',
  'detras': 'detrás',
  'atras': 'atrás',
  'pagina': 'página',
  'paginas': 'páginas',
  'aqui': 'aquí',
  'alli': 'allí',
  'asi': 'así',
  'rapido': 'rápido',
  'rapida': 'rápida',
  'rapidos': 'rápidos',
  'rapidas': 'rápidas',
  'rapidamente': 'rápidamente',
  'practico': 'práctico',
  'practica': 'práctica',
  'practicos': 'prácticos',
  'practicas': 'prácticas',
  'automatico': 'automático',
  'automatica': 'automática',
  'automaticos': 'automáticos',
  'automaticas': 'automáticas',
  'analiticos': 'analíticos',
  'analitico': 'analítico',
  'estadisticas': 'estadísticas',
  'estadistica': 'estadística',

  // Palabras con tilde en é
  'huesped': 'huésped',
  'huespedes': 'huéspedes',
  'codigo': 'código',
  'codigos': 'códigos',
  'numero': 'número',
  'numeros': 'números',
  'ultimo': 'último',
  'ultima': 'última',
  'ultimos': 'últimos',
  'ultimas': 'últimas',
  'metodo': 'método',
  'metodos': 'métodos',
  'despues': 'después',
  'tambien': 'también',
  'telefono': 'teléfono',
  'telefonos': 'teléfonos',

  // Palabras con tilde en í
  'facil': 'fácil',
  'faciles': 'fáciles',
  'facilmente': 'fácilmente',
  'unico': 'único',
  'unica': 'única',
  'unicos': 'únicos',
  'tecnico': 'técnico',
  'tecnica': 'técnica',
  'tecnicos': 'técnicos',
  'tecnicas': 'técnicas',
  'basico': 'básico',
  'basica': 'básica',
  'basicos': 'básicos',
  'basicas': 'básicas',
  'tipico': 'típico',
  'tipica': 'típica',
  'tipicos': 'típicos',
  'tipicas': 'típicas',

  // Palabras con tilde en ó
  'proximos': 'próximos',
  'proxima': 'próxima',
  'proximo': 'próximo',
  'proximas': 'próximas',
  'informacion': 'información',
  'gestion': 'gestión',
  'optimizacion': 'optimización',
  'configuracion': 'configuración',
  'ubicacion': 'ubicación',
  'operacion': 'operación',
  'operaciones': 'operaciones',
  'solucion': 'solución',
  'soluciones': 'soluciones',
  'comunicacion': 'comunicación',
  'comunicaciones': 'comunicaciones',
  'instruccion': 'instrucción',
  'instrucciones': 'instrucciones',
  'automatizacion': 'automatización',
  'como': 'cómo',  // When interrogative
  'movil': 'móvil',
  'moviles': 'móviles',

  // Palabras con tilde en ú
  'tu': 'tú',  // Careful: only personal pronoun, not possessive
  'menu': 'menú',
  'menus': 'menús',

  // Otras correcciones comunes
  'porque': 'por qué',  // When interrogative - be careful
  'que': 'qué',  // When interrogative
  'donde': 'dónde',  // When interrogative
  'cuando': 'cuándo',  // When interrogative
  'cuanto': 'cuánto',  // When interrogative
  'cuantas': 'cuántas',
  'cuantos': 'cuántos',

  // Verbos comunes
  'esta': 'está',  // Third person verb
  'estas': 'estás',  // Second person verb
  'estan': 'están',
  'sera': 'será',
  'seran': 'serán',
  'estara': 'estará',
  'estaran': 'estarán',
  'podras': 'podrás',
  'tendras': 'tendrás',
  'recibiras': 'recibirás',
  'veras': 'verás',
  'sabras': 'sabrás',
  'encontraras': 'encontrarás',
  'enviare': 'enviaré',
  'comparare': 'compararé',
  'contare': 'contaré',
  'hablare': 'hablaré',
  'conoceras': 'conocerás',
  'tenia': 'tenía',
  'podia': 'podía',
  'hacia': 'hacía',
  'decia': 'decía',
  'sabia': 'sabía',
  'habia': 'había',
}

// Words that should NOT be corrected (exceptions)
const exceptions = [
  'mas',  // When it means "but" in some contexts - we'll be careful
  'tu',   // When possessive (tu casa)
  'como', // When not interrogative
  'que',  // When not interrogative
  'esta', // When demonstrative (esta casa)
  'donde',// When not interrogative
]

// Directories to process
const directories = [
  'src/emails/templates',
  'src/lib',
  'app',
]

// File extensions to process
const extensions = ['.tsx', '.ts']

// Words that need context-aware replacement (won't auto-replace)
const contextSensitive = ['mas', 'tu', 'como', 'que', 'esta', 'donde', 'cuando', 'porque']

// Safe corrections (always correct regardless of context)
const safeCorrections: Record<string, string> = {}
for (const [wrong, correct] of Object.entries(corrections)) {
  if (!contextSensitive.includes(wrong)) {
    safeCorrections[wrong] = correct
  }
}

function processFile(filePath: string): { file: string; changes: string[] } {
  const content = readFileSync(filePath, 'utf-8')
  let newContent = content
  const changes: string[] = []

  for (const [wrong, correct] of Object.entries(safeCorrections)) {
    // Create regex that matches whole words (case-insensitive for detection)
    // But preserves case in replacement
    const regex = new RegExp(`\\b${wrong}\\b`, 'gi')
    const matches = content.match(regex)

    if (matches) {
      for (const match of matches) {
        // Preserve original case
        let replacement = correct
        if (match === match.toUpperCase()) {
          replacement = correct.toUpperCase()
        } else if (match[0] === match[0].toUpperCase()) {
          replacement = correct[0].toUpperCase() + correct.slice(1)
        }

        const lineRegex = new RegExp(`\\b${match}\\b`, 'g')
        if (newContent !== newContent.replace(lineRegex, replacement)) {
          changes.push(`${match} → ${replacement}`)
        }
        newContent = newContent.replace(lineRegex, replacement)
      }
    }
  }

  if (changes.length > 0) {
    writeFileSync(filePath, newContent, 'utf-8')
  }

  return { file: filePath, changes }
}

function walkDirectory(dir: string, callback: (file: string) => void) {
  try {
    const files = readdirSync(dir)
    for (const file of files) {
      const filePath = join(dir, file)
      try {
        const stat = statSync(filePath)
        if (stat.isDirectory()) {
          walkDirectory(filePath, callback)
        } else if (extensions.some(ext => file.endsWith(ext))) {
          callback(filePath)
        }
      } catch {
        // Skip inaccessible files
      }
    }
  } catch {
    // Skip inaccessible directories
  }
}

async function main() {
  console.log('🔤 Corrigiendo tildes y ñ en textos españoles...\n')

  const results: { file: string; changes: string[] }[] = []

  for (const dir of directories) {
    const fullPath = join(process.cwd(), dir)
    walkDirectory(fullPath, (file) => {
      const result = processFile(file)
      if (result.changes.length > 0) {
        results.push(result)
      }
    })
  }

  // Print results
  let totalChanges = 0
  for (const result of results) {
    console.log(`📝 ${result.file.replace(process.cwd() + '/', '')}`)
    const uniqueChanges = [...new Set(result.changes)]
    for (const change of uniqueChanges) {
      const count = result.changes.filter(c => c === change).length
      console.log(`   ${change} (${count}x)`)
    }
    totalChanges += result.changes.length
    console.log('')
  }

  console.log(`\n✅ Total: ${totalChanges} correcciones en ${results.length} archivos`)

  // Show context-sensitive words that need manual review
  console.log('\n⚠️  Palabras que requieren revisión manual (dependen del contexto):')
  console.log('   - "mas" → "más" (solo cuando significa "more", no "but")')
  console.log('   - "tu" → "tú" (solo pronombre personal, no posesivo)')
  console.log('   - "como" → "cómo" (solo interrogativo)')
  console.log('   - "que" → "qué" (solo interrogativo)')
  console.log('   - "esta" → "está" (solo verbo, no demostrativo)')
}

main()
