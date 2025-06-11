#!/bin/bash

echo "🚀 Setting up Itineramio development environment..."

# Check Node version
NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18+ required. Please upgrade."
    exit 1
fi

# Install pnpm if not installed
if ! command -v pnpm &> /dev/null; then
    echo "📦 Installing pnpm..."
    npm install -g pnpm
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Setup environment file
if [ ! -f .env.local ]; then
    echo "🔧 Creating .env.local..."
    cp .env.example .env.local
    echo "⚠️  Please edit .env.local with your database credentials"
fi

# Generate Prisma client
echo "🗄️  Generating Prisma client..."
pnpm prisma generate

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env.local with your database URL"
echo "2. Run 'pnpm prisma migrate dev' to setup database"
echo "3. Run 'pnpm dev' to start development"