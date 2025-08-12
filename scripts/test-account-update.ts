import { prisma } from '../src/lib/prisma'

async function testAccountUpdate() {
  try {
    // Get a test user
    const user = await prisma.user.findFirst()
    
    if (!user) {
      console.log('❌ No users found')
      return
    }
    
    console.log('Testing with user:', user.email)
    
    // Test 1: Missing fields
    console.log('\n📝 Test 1: Missing fields')
    const test1 = await fetch('http://localhost:3000/api/account/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com'
      })
    })
    
    if (!test1.ok) {
      const data = await test1.json()
      console.log('❌ Expected error:', data)
    }
    
    // Test 2: Valid update
    console.log('\n📝 Test 2: Valid update')
    const nameParts = user.name?.split(' ') || ['Test', 'User']
    const test2Body = {
      firstName: nameParts[0] || 'Test',
      lastName: nameParts.slice(1).join(' ') || 'User',
      email: user.email,
      phone: user.phone || ''
    }
    console.log('Request body:', test2Body)
    
    // Test 3: Email change
    console.log('\n📝 Test 3: Email change')
    const test3Body = {
      firstName: nameParts[0] || 'Test',
      lastName: nameParts.slice(1).join(' ') || 'User',
      email: 'newemail@example.com',
      phone: user.phone || ''
    }
    console.log('Request body:', test3Body)
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

testAccountUpdate()