# ManualPhi Deployment Checklist

## 🚀 Pre-deployment Steps

### 1. Fix Build Issues
Run the comprehensive fix script:
```bash
node fix-build-issues.js
```

### 2. Verify Configuration
Check all configurations are correct:
```bash
node verify-config.js
```

### 3. Find Remaining @/ Imports
Check if any alias imports remain:
```bash
node find-alias-imports.js
```

### 4. Environment Variables
Ensure these are set in Vercel:

#### Required Variables:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `NEXT_PUBLIC_API_URL` - Your API URL (usually same as app URL)
- `NEXT_PUBLIC_APP_URL` - Your app URL
- `RESEND_API_KEY` - Resend API key for emails
- `RESEND_FROM_EMAIL` - Email address to send from
- `RESEND_VERIFIED_DOMAIN` - Your verified domain in Resend
- `BLOB_READ_WRITE_TOKEN` - Vercel Blob storage token

#### Optional Variables:
- `NEXTAUTH_URL` - If using NextAuth
- `NEXTAUTH_SECRET` - If using NextAuth
- `NODE_ENV` - Set to "production"

### 5. Database Setup
1. Ensure PostgreSQL database is accessible
2. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```

### 6. Local Build Test
Test the build locally:
```bash
npm run build
```

## 📋 Vercel Deployment Settings

### Build & Development Settings:
- **Framework Preset**: Next.js
- **Build Command**: `npm run build` or `prisma generate && next build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### Environment Variables:
Add all required variables from step 4 above.

### Functions Region:
Choose region closest to your database.

## 🐛 Common Issues & Solutions

### 1. "Cannot find module 'autoprefixer'"
- Already fixed in package.json
- Run `npm install` to ensure it's installed

### 2. "@/ import not found" errors
- Run `node fix-build-issues.js` to convert all imports
- The script will automatically fix all @/ imports to relative paths

### 3. Prisma Client errors
- Ensure `prisma generate` runs before build
- Already configured in package.json build script

### 4. Environment variable errors
- Double-check all required variables are set in Vercel
- Use Vercel CLI to verify: `vercel env pull`

### 5. Database connection errors
- Verify DATABASE_URL is correct
- Ensure database allows connections from Vercel IPs
- Consider using connection pooling for serverless

## ✅ Final Checklist

- [ ] All dependencies installed (`npm install`)
- [ ] No @/ imports remain (check with `node find-alias-imports.js`)
- [ ] Build succeeds locally (`npm run build`)
- [ ] All environment variables set in Vercel
- [ ] Database is accessible and migrated
- [ ] Prisma client generated
- [ ] No TypeScript errors

## 🚀 Deploy Command

Once everything is ready:
```bash
git add .
git commit -m "Fix build issues and prepare for deployment"
git push origin main
```

Vercel will automatically deploy from your GitHub repository.