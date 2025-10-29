const jwt = require('jsonwebtoken')

const token = jwt.sign(
  { userId: 'cmgy660l100047c2pj4m58uup' },
  'itineramio-jwt-secret-key-2024-super-secure-change-in-production',
  { expiresIn: '7d' }
)

fetch('http://localhost:3000/api/dashboard/data', {
  headers: {
    'Cookie': `auth-token=${token}`
  }
})
  .then(res => res.json())
  .then(data => {
    console.log('\n📊 Respuesta del API:')
    console.log('Success:', data.success)

    if (data.data) {
      console.log('\n🔍 Trial Status:')
      console.log(JSON.stringify(data.data.trialStatus, null, 2))

      console.log('\n💳 Has Active Subscription:')
      console.log(data.data.hasActiveSubscription)

      if (!data.data.trialStatus) {
        console.log('\n❌ PROBLEMA: trialStatus no está en la respuesta')
      } else if (!data.data.trialStatus.isActive) {
        console.log('\n⚠️  Trial no está marcado como activo')
      } else {
        console.log('\n✅ Trial Status está presente y activo')
        console.log('Días restantes:', data.data.trialStatus.daysRemaining)
      }
    }
  })
  .catch(err => {
    console.error('❌ Error:', err.message)
  })
