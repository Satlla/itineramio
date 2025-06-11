# Itineramio Web App

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- pnpm (`npm install -g pnpm`)
- PostgreSQL database (Supabase or local)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/Satlla/itineramio.git
   cd itineramio/apps/web
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Then edit `.env.local` with your values:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
   - `BLOB_READ_WRITE_TOKEN`: Only needed for production

4. **Set up the database**
   
   Option A - Use Supabase (Recommended):
   - Create a free project at https://supabase.com
   - Copy the connection string to `.env.local`
   
   Option B - Use Docker:
   ```bash
   docker-compose up -d
   # Use this connection string:
   # DATABASE_URL="postgresql://postgres:postgres@localhost:5432/itineramio_dev"
   ```

5. **Run database migrations**
   ```bash
   pnpm prisma migrate dev
   ```

6. **Seed the database (optional)**
   ```bash
   pnpm run seed
   ```

7. **Start the development server**
   ```bash
   pnpm dev
   ```

   Open http://localhost:3000

## 📁 Project Structure

```
apps/web/
├── app/              # Next.js 13+ app directory
├── src/
│   ├── components/   # Reusable components
│   ├── lib/         # Utilities and configurations
│   └── types/       # TypeScript types
├── prisma/          # Database schema and migrations
└── public/          # Static assets
```

## 🔧 Common Commands

```bash
# Development
pnpm dev              # Start dev server
pnpm build           # Build for production
pnpm start           # Start production server

# Database
pnpm prisma studio   # Open Prisma Studio
pnpm prisma migrate dev     # Create migration
pnpm prisma migrate deploy  # Apply migrations

# Code Quality
pnpm lint            # Run ESLint
pnpm type-check      # Run TypeScript check
```

## 🌳 Git Workflow

1. Create a feature branch
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

3. Push to GitHub
   ```bash
   git push origin feature/your-feature-name
   ```

4. Create a Pull Request on GitHub

## 🚀 Deployment

The app auto-deploys to Vercel when pushing to `main` branch.

### Environment Variables in Vercel:
- `DATABASE_URL`: Production database (Supabase)
- `BLOB_READ_WRITE_TOKEN`: Vercel Blob storage token
- `NEXTAUTH_SECRET`: Production secret

## 📝 Contributing

1. Follow the Git workflow above
2. Write meaningful commit messages
3. Add tests for new features
4. Update documentation as needed

## 🆘 Troubleshooting

### Images not loading in development
- Local uploads go to `public/uploads/`
- Production images use Vercel Blob Storage
- This is normal behavior

### Database connection issues
- Check your `DATABASE_URL` in `.env.local`
- Ensure PostgreSQL is running
- Try `pnpm prisma generate`

## 📞 Support

- Create an issue on GitHub
- Contact the team lead