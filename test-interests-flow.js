// Test Interest Capture Flow
// This script tests the complete flow of interest capture in production

const BASE_URL = 'https://www.itineramio.com';

// Generate 45 mock answers - simplified approach
function generateMockAnswers() {
  const dimensions = ['HOSPITALIDAD', 'COMUNICACION', 'OPERATIVA', 'CRISIS', 'DATA', 'LIMITES', 'MKT', 'BALANCE'];
  const answers = [];

  // Generate exactly 45 answers (IDs 1-45)
  for (let i = 1; i <= 45; i++) {
    // Distribute evenly across dimensions (45/8 ≈ 5.6 questions per dimension)
    const dimensionIndex = Math.floor((i - 1) / 6) % dimensions.length;
    const dimension = dimensions[dimensionIndex];

    answers.push({
      questionId: i,
      dimension: dimension,
      value: Math.floor(Math.random() * 2) + 4 // Valores entre 4-5 para tener un buen arquetipo
    });
  }

  console.log(`   Generated ${answers.length} answers`);
  return answers;
}

async function testInterestFlow() {
  console.log('🧪 TESTING INTEREST CAPTURE FLOW IN PRODUCTION\n');

  // Test data
  const testEmail = `test-${Date.now()}@itineramio.com`;
  const testName = 'Claude Test User';
  const testGender = 'M';
  const testInterests = ['pricing', 'automation', 'reviews']; // 3 intereses

  console.log('📋 Test Data:');
  console.log(`   Email: ${testEmail}`);
  console.log(`   Name: ${testName}`);
  console.log(`   Gender: ${testGender}`);
  console.log(`   Interests: ${testInterests.join(', ')}`);
  console.log('');

  // Step 1: Submit test with interests
  console.log('📤 STEP 1: Submitting test with interests...');

  try {
    const response = await fetch(`${BASE_URL}/api/host-profile/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        answers: generateMockAnswers(),
        email: testEmail,
        name: testName,
        gender: testGender,
        interests: testInterests
      })
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('❌ Error submitting test:', result.error);
      return;
    }

    console.log('✅ Test submitted successfully!');
    console.log(`   Result ID: ${result.resultId}`);
    console.log(`   Archetype: ${result.archetype}`);
    console.log(`   Top Strength: ${result.topStrength}`);
    console.log(`   Critical Gap: ${result.criticalGap}`);
    console.log('');

    // Debug info
    if (result.debug) {
      console.log('🐛 Debug Info:');
      console.log(`   Email sent: ${result.debug.emailSent ? '✅ Yes' : '❌ No'}`);
      console.log(`   Email error: ${result.debug.emailError || 'None'}`);
      console.log(`   Subscriber ID: ${result.debug.subscriberId || 'None'}`);
      console.log(`   Has Subscriber: ${result.debug.hasSubscriber ? '✅ Yes' : '❌ No'}`);
      console.log('');
    }

    // Step 2: Verify the data was saved correctly
    console.log('🔍 STEP 2: Test completed successfully!');
    console.log('');
    console.log('✅ WHAT TO VERIFY:');
    console.log('   1. Check your email inbox for the welcome email');
    console.log('   2. Email should contain personalized content based on interests:');
    console.log('      - Optimizar tu estrategia de precios');
    console.log('      - Automatizar tareas repetitivas');
    console.log('      - Mejorar tus reviews y calificaciones');
    console.log('   3. The email should also include:');
    console.log('      - Casos de éxito de anfitriones como tú');
    console.log('      - Plantillas descargables gratuitas');
    console.log('');
    console.log('📊 DATABASE VERIFICATION (optional):');
    console.log(`   Run this query to check the EmailSubscriber record:`);
    console.log(`   SELECT email, interests, topPriority, contentTrack FROM "EmailSubscriber" WHERE email = '${testEmail}';`);
    console.log('');
    console.log('   Expected values:');
    console.log(`   - interests: ["pricing", "automation", "reviews"]`);
    console.log(`   - topPriority: "pricing"`);
    console.log(`   - contentTrack: "pricing_focused"`);
    console.log('');
    console.log('🎉 INTEREST CAPTURE FLOW TEST COMPLETED!');

  } catch (error) {
    console.error('❌ Error during test:', error.message);
  }
}

// Run the test
testInterestFlow().catch(console.error);
