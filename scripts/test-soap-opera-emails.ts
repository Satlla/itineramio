/**
 * Script para enviar todos los emails del embudo Soap Opera
 * a una direccion de prueba
 */

import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })

import {
  sendSoapOperaEmail1,
  sendSoapOperaEmail2,
  sendSoapOperaEmail3,
  sendSoapOperaEmail4,
  sendSoapOperaEmail5,
  sendSoapOperaEmail6,
  sendSoapOperaEmail7,
  sendSoapOperaEmail8,
  type SoapOperaNivel,
} from '../src/lib/resend'

const TEST_EMAIL = process.argv[2] || 'alejandrosatlla@gmail.com'
const TEST_NAME = 'Alejandro'
const TEST_NIVEL: SoapOperaNivel = (process.argv[3] as SoapOperaNivel) || 'intermedio'

async function sendAllEmails() {
  console.log('='.repeat(60))
  console.log('ENVIANDO EMBUDO SOAP OPERA COMPLETO')
  console.log('='.repeat(60))
  console.log(`Email: ${TEST_EMAIL}`)
  console.log(`Nombre: ${TEST_NAME}`)
  console.log(`Nivel: ${TEST_NIVEL}`)
  console.log('='.repeat(60))
  console.log('')

  const emails = [
    { fn: sendSoapOperaEmail1, day: 1, name: 'Bienvenida + Historia' },
    { fn: sendSoapOperaEmail2, day: 3, name: 'El Problema' },
    { fn: sendSoapOperaEmail3, day: 5, name: 'La Revelacion' },
    { fn: sendSoapOperaEmail4, day: 7, name: 'Caso de Exito' },
    { fn: sendSoapOperaEmail5, day: 9, name: 'El Metodo' },
    { fn: sendSoapOperaEmail6, day: 11, name: 'Objeciones' },
    { fn: sendSoapOperaEmail7, day: 13, name: 'Urgencia' },
    { fn: sendSoapOperaEmail8, day: 15, name: 'Ultima Oportunidad' },
  ]

  let successCount = 0
  let errorCount = 0

  for (const email of emails) {
    try {
      console.log(`[Dia ${email.day}] Enviando: ${email.name}...`)

      const result = await email.fn({
        email: TEST_EMAIL,
        name: TEST_NAME,
        nivel: TEST_NIVEL,
      })

      if (result.success) {
        console.log(`  ✅ Enviado correctamente`)
        successCount++
      } else {
        console.log(`  ❌ Error: ${result.error}`)
        errorCount++
      }

      // Pequena pausa entre emails para no sobrecargar
      await new Promise(resolve => setTimeout(resolve, 1000))

    } catch (error) {
      console.log(`  ❌ Error: ${error}`)
      errorCount++
    }
  }

  console.log('')
  console.log('='.repeat(60))
  console.log('RESUMEN')
  console.log('='.repeat(60))
  console.log(`✅ Emails enviados: ${successCount}`)
  console.log(`❌ Errores: ${errorCount}`)
  console.log('')
  console.log('Revisa tu bandeja de entrada en:', TEST_EMAIL)
  console.log('='.repeat(60))
}

sendAllEmails().catch(console.error)
