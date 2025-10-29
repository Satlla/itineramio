// Test billing period normalization logic

console.log('🧪 Testing Billing Period Normalization\n')

// Simulate the normalization logic from approve routes
function normalizeBillingPeriod(input) {
  let billingPeriod = input || 'MONTHLY'

  // Normalize billing period to handle case variations and "semiannual" variant
  billingPeriod = billingPeriod.toUpperCase()
  if (billingPeriod === 'SEMIANNUAL') {
    billingPeriod = 'BIANNUAL'
  }

  return billingPeriod
}

// Calculate duration based on normalized billing period
function calculateDuration(billingPeriod) {
  const startDate = new Date('2025-10-27')
  const endDate = new Date('2025-10-27')

  switch (billingPeriod) {
    case 'MONTHLY':
      endDate.setMonth(endDate.getMonth() + 1)
      return { months: 1, endDate }
    case 'BIANNUAL':
      endDate.setMonth(endDate.getMonth() + 6)
      return { months: 6, endDate }
    case 'ANNUAL':
      endDate.setFullYear(endDate.getFullYear() + 1)
      return { months: 12, endDate }
    default:
      endDate.setMonth(endDate.getMonth() + 1)
      return { months: 1, endDate }
  }
}

// Test cases
const testCases = [
  { input: 'semiannual', expected: 'BIANNUAL', duration: 6, label: 'Frontend format (lowercase)' },
  { input: 'SEMIANNUAL', expected: 'BIANNUAL', duration: 6, label: 'Frontend format (uppercase)' },
  { input: 'Semiannual', expected: 'BIANNUAL', duration: 6, label: 'Frontend format (mixed case)' },
  { input: 'biannual', expected: 'BIANNUAL', duration: 6, label: 'Backend format (lowercase)' },
  { input: 'BIANNUAL', expected: 'BIANNUAL', duration: 6, label: 'Backend format (uppercase)' },
  { input: 'monthly', expected: 'MONTHLY', duration: 1, label: 'Monthly (lowercase)' },
  { input: 'MONTHLY', expected: 'MONTHLY', duration: 1, label: 'Monthly (uppercase)' },
  { input: 'annual', expected: 'ANNUAL', duration: 12, label: 'Annual (lowercase)' },
  { input: 'ANNUAL', expected: 'ANNUAL', duration: 12, label: 'Annual (uppercase)' },
]

let passed = 0
let failed = 0

testCases.forEach((test, index) => {
  const normalized = normalizeBillingPeriod(test.input)
  const duration = calculateDuration(normalized)

  const periodMatch = normalized === test.expected
  const durationMatch = duration.months === test.duration
  const success = periodMatch && durationMatch

  if (success) {
    console.log(`✅ Test ${index + 1}: ${test.label}`)
    console.log(`   Input: "${test.input}" → "${normalized}" → ${duration.months} months`)
    console.log(`   End date: ${duration.endDate.toISOString().split('T')[0]}`)
    passed++
  } else {
    console.log(`❌ Test ${index + 1}: ${test.label}`)
    console.log(`   Input: "${test.input}"`)
    console.log(`   Expected: "${test.expected}" (${test.duration} months)`)
    console.log(`   Got: "${normalized}" (${duration.months} months)`)
    failed++
  }
  console.log()
})

// Summary
console.log('━'.repeat(60))
console.log(`📊 Test Summary: ${passed} passed, ${failed} failed`)

if (failed === 0) {
  console.log('✅ All tests passed! Billing period normalization is working correctly.')
  process.exit(0)
} else {
  console.log('❌ Some tests failed. Please review the normalization logic.')
  process.exit(1)
}
