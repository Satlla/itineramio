#!/bin/bash

# Fix database URL issue - unset system environment variable
echo "Fixing DATABASE_URL environment variable..."

# Unset the system DATABASE_URL to use .env.local instead
unset DATABASE_URL

# Export the correct DATABASE_URL from .env.local
export DATABASE_URL="postgresql://postgres.scgbdfltemsthgwianbl:Bolero1492*@aws-0-eu-north-1.pooler.supabase.com:5432/postgres"

echo "DATABASE_URL fixed. Starting development server..."
npm run dev