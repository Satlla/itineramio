#!/bin/bash
cd /Users/alejandrosatlla/Documents/itineramio

echo "🔍 Checking TypeScript compilation..."
npm run build

echo "📁 File exists check:"
ls -la "app/(dashboard)/properties/[id]/zones/page.tsx"

echo "📝 File size check:"
wc -l "app/(dashboard)/properties/[id]/zones/page.tsx"

echo "🔧 Running type check only:"
npx tsc --noEmit --skipLibCheck