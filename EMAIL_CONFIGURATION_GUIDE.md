# Email Configuration Guide for ManualPhi

## Issues Found

1. **Domain Verification Error (Main Issue)**
   - The domain `itineramio.com` is not verified in Resend
   - This causes a 403 error when trying to send emails
   - This is likely causing the 500 error on `/api/auth/verify-email`

2. **Email Sending Flow**
   - Registration endpoint correctly tries to send verification email
   - Email service fails due to domain verification
   - Users are created but can't verify their emails

## Solutions

### Option 1: Verify the Domain (Recommended for Production)

1. Go to [Resend Domains Dashboard](https://resend.com/domains)
2. Add the domain `itineramio.com`
3. Add the required DNS records (SPF, DKIM, etc.)
4. Wait for verification (usually takes a few minutes)

### Option 2: Use Resend's Test Email (For Development)

1. Update your `.env.local` file:
```env
RESEND_FROM_EMAIL=onboarding@resend.dev
```

2. Replace the email configuration file:
```bash
mv src/lib/email.ts src/lib/email.ts.backup
mv src/lib/email-fixed.ts src/lib/email.ts
```

### Option 3: Use a Different Verified Domain

If you have another domain verified in Resend:
1. Update the from email in `/src/lib/email.ts` line 18
2. Or set the `RESEND_FROM_EMAIL` environment variable

## Testing the Fix

After implementing one of the solutions above:

```bash
# Test email sending
node test-resend-domain.js

# Test registration with real email
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "your-email@example.com",
    "phone": "1234567890",
    "password": "TestPass123",
    "confirmPassword": "TestPass123",
    "acceptTerms": true
  }'
```

## Environment Variables

Ensure these are set in `.env.local`:
```env
# Resend API Key (already set)
RESEND_API_KEY=re_EuT63Wc2_Np1z28sdw1EB8QqK9yy86y76

# Optional: Override from email
RESEND_FROM_EMAIL=your-verified-email@domain.com

# App URL for email links (already set)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Additional Improvements Made

1. **Better Error Handling**: The fixed email service provides clearer error messages
2. **Development Mode**: Emails won't crash the app in development if they fail
3. **Logging**: Better console logging to debug email issues
4. **Fallback**: Uses Resend's test email in development if domain isn't verified

## Clean Up

After testing, remove the test files:
```bash
rm test-email.js test-resend-domain.js
```