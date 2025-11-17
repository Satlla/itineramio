const { Resend } = require('resend')
const fs = require('fs')
const path = require('path')

// Cargar .env.local manualmente
const envPath = path.join(__dirname, '.env.local')
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8')
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/)
    if (match) {
      const key = match[1].trim()
      const value = match[2].trim()
      process.env[key] = value
    }
  })
}

const resend = new Resend(process.env.RESEND_API_KEY)

async function testResend() {
  console.log('\n🧪 TEST DE RESEND\n')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  console.log(`API KEY configurada: ${process.env.RESEND_API_KEY ? '✅ SÍ' : '❌ NO'}`)
  console.log(`Primeros caracteres: ${process.env.RESEND_API_KEY?.substring(0, 10)}...\n`)

  console.log('📧 Intentando enviar email de prueba...\n')

  try {
    const { data, error } = await resend.emails.send({
      from: 'Itineramio <hola@itineramio.com>',
      to: ['colaboracionesbnb@gmail.com'],
      subject: '🧪 Test de Resend - Sistema de Emails',
      html: `
        <h1>Test de Resend</h1>
        <p>Si recibes este email, el sistema de envío funciona correctamente.</p>
        <p>Fecha: ${new Date().toISOString()}</p>
      `
    })

    if (error) {
      console.error('❌ ERROR al enviar:', error)
      console.error('\nDetalles del error:', JSON.stringify(error, null, 2))
      return
    }

    console.log('✅ EMAIL ENVIADO EXITOSAMENTE!')
    console.log('\nDetalles:', JSON.stringify(data, null, 2))

  } catch (err) {
    console.error('❌ EXCEPCIÓN:', err)
  }
}

testResend()
