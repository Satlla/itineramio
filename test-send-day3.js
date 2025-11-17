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

const { Resend } = require('resend')
const resend = new Resend(process.env.RESEND_API_KEY)

async function testDay3Email() {
  console.log('\n📧 TEST DE EMAIL DÍA 3\n')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  try {
    const { data, error } = await resend.emails.send({
      from: 'Itineramio <hola@itineramio.com>',
      to: ['colaboracionesbnb@gmail.com'],
      subject: '🎯 TEST - Los 3 errores que comete todo ESTRATEGA',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>Hola Anfitrión,</h1>
          <p>Este es un email de prueba del sistema de secuencias.</p>
          <p><strong>Arquetipo:</strong> ESTRATEGA</p>
          <p><strong>Email:</strong> Día 3 - Errores comunes</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            Si recibes este email, el sistema de Resend está funcionando correctamente.
          </p>
        </div>
      `
    })

    if (error) {
      console.error('❌ ERROR:', error)
      console.error('\nDetalles:', JSON.stringify(error, null, 2))
      return
    }

    console.log('✅ EMAIL ENVIADO EXITOSAMENTE!')
    console.log('\nID del email:', data.id)
    console.log('Detalles:', JSON.stringify(data, null, 2))
    console.log('\n⏰ El email debería llegar en 1-2 minutos.')
    console.log('📬 Revisa tu bandeja y spam.\n')

  } catch (err) {
    console.error('❌ EXCEPCIÓN:', err.message)
    console.error('\nStack:', err.stack)
  }
}

testDay3Email()
