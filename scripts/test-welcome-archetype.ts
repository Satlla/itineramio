/**
 * Script para enviar el email de bienvenida del quiz de arquetipo
 * Usage: npx tsx scripts/test-welcome-archetype.ts email@example.com ESTRATEGA
 */

import { sendWelcomeTestEmail, type EmailArchetype } from '@/lib/resend'

const VALID_ARCHETYPES: EmailArchetype[] = [
  'ESTRATEGA',
  'SISTEMATICO',
  'DIFERENCIADOR',
  'EJECUTOR',
  'RESOLUTOR',
  'EXPERIENCIAL',
  'EQUILIBRADO',
  'IMPROVISADOR'
]

async function main() {
  const email = process.argv[2] || 'alejandrosatlla@gmail.com'
  const archetype = (process.argv[3]?.toUpperCase() || 'ESTRATEGA') as EmailArchetype
  const name = process.argv[4] || 'Alejandro'

  if (!VALID_ARCHETYPES.includes(archetype)) {
    console.error(`❌ Arquetipo inválido: ${archetype}`)
    console.log('Arquetipos válidos:', VALID_ARCHETYPES.join(', '))
    process.exit(1)
  }

  console.log(`\n📧 Enviando email de bienvenida del quiz...`)
  console.log(`   Email: ${email}`)
  console.log(`   Arquetipo: ${archetype}`)
  console.log(`   Nombre: ${name}\n`)

  try {
    const result = await sendWelcomeTestEmail({
      email,
      name,
      archetype,
      interests: ['automation', 'reviews', 'pricing']
    })

    if (result.success) {
      console.log('✅ Email enviado correctamente')
      console.log('   ID:', result.id)
    } else {
      console.error('❌ Error al enviar:', result.error)
    }
  } catch (error) {
    console.error('❌ Error:', error)
  }

  process.exit(0)
}

main()
