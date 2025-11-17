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
      let value = match[2].trim()
      // Limpiar comillas si existen
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1)
      }
      process.env[key] = value
    }
  })
}

const { Resend } = require('resend')
const resend = new Resend(process.env.RESEND_API_KEY)

async function testSandbox() {
  console.log('\n📧 TEST CON RESEND SANDBOX (onboarding@resend.dev)\n')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  console.log(`API KEY: ${process.env.RESEND_API_KEY?.substring(0, 15)}...\n`)

  try {
    const { data, error } = await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>', // Email sandbox de Resend
      to: ['colaboracionesbnb@gmail.com'],
      subject: '🧪 Test Resend - Verificación de API Key',
      html: `
        <h1>Test de Resend</h1>
        <p>Si recibes este email, la API key está funcionando correctamente.</p>
        <p><strong>Enviado desde:</strong> onboarding@resend.dev (sandbox)</p>
        <p><strong>Hora:</strong> ${new Date().toISOString()}</p>
      `
    })

    if (error) {
      console.error('❌ ERROR:', error)
      console.error('\nDetalles:', JSON.stringify(error, null, 2))

      if (error.message?.includes('API key')) {
        console.error('\n💡 SOLUCIÓN:')
        console.error('   1. Verifica que la API key sea correcta')
        console.error('   2. Revisa que tenga permisos de "Sending"')
        console.error('   3. Comprueba que no haya espacios extras')
      }
      return
    }

    console.log('✅ EMAIL ENVIADO EXITOSAMENTE!')
    console.log('\nID del email:', data.id)
    console.log('\n⏰ El email debería llegar en 1-2 minutos.')
    console.log('📬 Revisa tu bandeja: colaboracionesbnb@gmail.com\n')

  } catch (err) {
    console.error('❌ EXCEPCIÓN:', err.message)
  }
}

testSandbox()
