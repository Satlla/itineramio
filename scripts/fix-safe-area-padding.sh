#!/bin/bash

# Script to fix safe-area padding on all dashboard pages
# Adds calc(4rem + env(safe-area-inset-top, 0px)) to min-h-screen containers

echo "🔧 Fixing safe-area padding on dashboard pages..."

# Fix files with INCORRECT paddingTop (missing calc wrapper)
echo "📝 Fixing zones/new/page.tsx..."
sed -i '' 's/paddingTop: '\''env(safe-area-inset-top, 0px)'\''/paddingTop: '\''calc(4rem + env(safe-area-inset-top, 0px))'\''/g' "app/(dashboard)/properties/[id]/zones/new/page.tsx"

echo "📝 Fixing zones/[zoneId]/steps/new/page.tsx..."
sed -i '' 's/paddingTop: '\''env(safe-area-inset-top, 0px)'\''/paddingTop: '\''calc(4rem + env(safe-area-inset-top, 0px))'\''/g' "app/(dashboard)/properties/[id]/zones/[zoneId]/steps/new/page.tsx"

# Fix files with NO paddingTop - add style prop with paddingTop
# Pattern 1: min-h-screen bg-gray-50">
echo "📝 Fixing analytics/page.tsx..."
sed -i '' 's/<div className="min-h-screen bg-gray-50">/<div className="min-h-screen bg-gray-50" style={{ paddingTop: '\''calc(4rem + env(safe-area-inset-top, 0px))'\'' }}>/g' "app/(dashboard)/analytics/page.tsx"

echo "📝 Fixing property-sets/page.tsx..."
sed -i '' 's/<div className="min-h-screen flex flex-col bg-gray-50">/<div className="min-h-screen flex flex-col bg-gray-50" style={{ paddingTop: '\''calc(4rem + env(safe-area-inset-top, 0px))'\'' }}>/g' "app/(dashboard)/property-sets/page.tsx"

echo "📝 Fixing property-sets/new/page.tsx..."
sed -i '' 's/<div className="min-h-screen bg-gray-50">/<div className="min-h-screen bg-gray-50" style={{ paddingTop: '\''calc(4rem + env(safe-area-inset-top, 0px))'\'' }}>/g' "app/(dashboard)/property-sets/new/page.tsx"

echo "📝 Fixing main/page.tsx..."
sed -i '' 's/<div className="min-h-screen flex flex-col bg-gray-50">/<div className="min-h-screen flex flex-col bg-gray-50" style={{ paddingTop: '\''calc(4rem + env(safe-area-inset-top, 0px))'\'' }}>/g' "app/(dashboard)/main/page.tsx"

echo "📝 Fixing account/billing/page.tsx..."
sed -i '' 's/<div className="min-h-screen bg-gray-50 py-6 sm:py-8 md:py-12 px-3 sm:px-4">/<div className="min-h-screen bg-gray-50 py-6 sm:py-8 md:py-12 px-3 sm:px-4" style={{ paddingTop: '\''calc(4rem + env(safe-area-inset-top, 0px))'\'' }}>/g' "app/(dashboard)/account/billing/page.tsx"

echo "📝 Fixing account/page.tsx..."
sed -i '' 's/<div className="min-h-screen bg-gray-50 py-8">/<div className="min-h-screen bg-gray-50 py-8" style={{ paddingTop: '\''calc(4rem + env(safe-area-inset-top, 0px))'\'' }}>/g' "app/(dashboard)/account/page.tsx"

echo "📝 Fixing account/plans/page.tsx..."
sed -i '' 's/<div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">/<div className="min-h-screen bg-gradient-to-b from-gray-50 to-white" style={{ paddingTop: '\''calc(4rem + env(safe-area-inset-top, 0px))'\'' }}>/g' "app/(dashboard)/account/plans/page.tsx"

echo "📝 Fixing properties/page.tsx..."
sed -i '' 's/<div className="min-h-screen bg-gray-50">/<div className="min-h-screen bg-gray-50" style={{ paddingTop: '\''calc(4rem + env(safe-area-inset-top, 0px))'\'' }}>/g' "app/(dashboard)/properties/page.tsx"
sed -i '' 's/<div className="min-h-screen bg-gray-50 flex items-center justify-center">/<div className="min-h-screen bg-gray-50 flex items-center justify-center" style={{ paddingTop: '\''calc(4rem + env(safe-area-inset-top, 0px))'\'' }}>/g' "app/(dashboard)/properties/page.tsx"

echo "📝 Fixing properties/[id]/page.tsx..."
sed -i '' 's/<div className="min-h-screen bg-gray-50 flex items-center justify-center">/<div className="min-h-screen bg-gray-50 flex items-center justify-center" style={{ paddingTop: '\''calc(4rem + env(safe-area-inset-top, 0px))'\'' }}>/g' "app/(dashboard)/properties/[id]/page.tsx"

echo "📝 Fixing properties/[id]/announcements/page.tsx..."
sed -i '' 's/<div className="min-h-screen bg-white">/<div className="min-h-screen bg-white" style={{ paddingTop: '\''calc(4rem + env(safe-area-inset-top, 0px))'\'' }}>/g' "app/(dashboard)/properties/[id]/announcements/page.tsx"

echo "📝 Fixing properties/groups/page.tsx..."
sed -i '' 's/<div className="min-h-screen flex flex-col bg-gray-50">/<div className="min-h-screen flex flex-col bg-gray-50" style={{ paddingTop: '\''calc(4rem + env(safe-area-inset-top, 0px))'\'' }}>/g' "app/(dashboard)/properties/groups/page.tsx"

echo "📝 Fixing properties/[id]/zones/qr/page.tsx..."
sed -i '' 's/<div className="min-h-screen bg-gray-50 flex items-center justify-center">/<div className="min-h-screen bg-gray-50 flex items-center justify-center" style={{ paddingTop: '\''calc(4rem + env(safe-area-inset-top, 0px))'\'' }}>/g' "app/(dashboard)/properties/[id]/zones/qr/page.tsx"
sed -i '' 's/<div className="min-h-screen bg-gray-50">/<div className="min-h-screen bg-gray-50" style={{ paddingTop: '\''calc(4rem + env(safe-area-inset-top, 0px))'\'' }}>/g' "app/(dashboard)/properties/[id]/zones/qr/page.tsx"

echo "📝 Fixing properties/groups/new/page.tsx..."
sed -i '' 's/<div className="min-h-screen bg-gray-50">/<div className="min-h-screen bg-gray-50" style={{ paddingTop: '\''calc(4rem + env(safe-area-inset-top, 0px))'\'' }}>/g' "app/(dashboard)/properties/groups/new/page.tsx"

echo "📝 Fixing subscription-success/page.tsx..."
sed -i '' 's/<div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">/<div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 flex items-center justify-center p-4" style={{ paddingTop: '\''calc(4rem + env(safe-area-inset-top, 0px))'\'' }}>/g' "app/(dashboard)/subscription-success/page.tsx"

echo "📝 Fixing subscriptions/page.tsx..."
sed -i '' 's/<div className="min-h-screen bg-white">/<div className="min-h-screen bg-white" style={{ paddingTop: '\''calc(4rem + env(safe-area-inset-top, 0px))'\'' }}>/g' "app/(dashboard)/subscriptions/page.tsx"
sed -i '' 's/<div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">/<div className="min-h-screen bg-gradient-to-b from-gray-50 to-white" style={{ paddingTop: '\''calc(4rem + env(safe-area-inset-top, 0px))'\'' }}>/g' "app/(dashboard)/subscriptions/page.tsx"

echo "📝 Fixing pricing-v2/page.tsx..."
sed -i '' 's/<div className="min-h-screen bg-gray-50">/<div className="min-h-screen bg-gray-50" style={{ paddingTop: '\''calc(4rem + env(safe-area-inset-top, 0px))'\'' }}>/g' "app/(dashboard)/pricing-v2/page.tsx"

echo "📝 Fixing test-login/page.tsx..."
sed -i '' 's/<div className="min-h-screen flex items-center justify-center">/<div className="min-h-screen flex items-center justify-center" style={{ paddingTop: '\''calc(4rem + env(safe-area-inset-top, 0px))'\'' }}>/g' "app/(dashboard)/test-login/page.tsx"

echo "📝 Fixing properties/[id]/zones/[zoneId]/steps/page.tsx..."
sed -i '' 's/<div className="min-h-screen flex items-center justify-center">/<div className="min-h-screen flex items-center justify-center" style={{ paddingTop: '\''calc(4rem + env(safe-area-inset-top, 0px))'\'' }}>/g' "app/(dashboard)/properties/[id]/zones/[zoneId]/steps/page.tsx"

echo "📝 Fixing properties/[id]/zones/[zoneId]/page.tsx..."
sed -i '' 's/<div className="min-h-screen bg-gray-50 flex items-center justify-center">/<div className="min-h-screen bg-gray-50 flex items-center justify-center" style={{ paddingTop: '\''calc(4rem + env(safe-area-inset-top, 0px))'\'' }}>/g' "app/(dashboard)/properties/[id]/zones/[zoneId]/page.tsx"
sed -i '' 's/<div className="min-h-screen bg-gray-50">/<div className="min-h-screen bg-gray-50" style={{ paddingTop: '\''calc(4rem + env(safe-area-inset-top, 0px))'\'' }}>/g' "app/(dashboard)/properties/[id]/zones/[zoneId]/page.tsx"

echo "📝 Fixing checkout/manual/page.tsx..."
sed -i '' 's/<div className="min-h-screen bg-gray-50 flex items-center justify-center">/<div className="min-h-screen bg-gray-50 flex items-center justify-center" style={{ paddingTop: '\''calc(4rem + env(safe-area-inset-top, 0px))'\'' }}>/g' "app/(dashboard)/checkout/manual/page.tsx"
sed -i '' 's/<div className="min-h-screen bg-gray-50 py-6 sm:py-8 md:py-12">/<div className="min-h-screen bg-gray-50 py-6 sm:py-8 md:py-12" style={{ paddingTop: '\''calc(4rem + env(safe-area-inset-top, 0px))'\'' }}>/g' "app/(dashboard)/checkout/manual/page.tsx"

echo "📝 Fixing properties/groups/[id]/page.tsx..."
sed -i '' 's/<div className="min-h-screen flex items-center justify-center">/<div className="min-h-screen flex items-center justify-center" style={{ paddingTop: '\''calc(4rem + env(safe-area-inset-top, 0px))'\'' }}>/g' "app/(dashboard)/properties/groups/[id]/page.tsx"
sed -i '' 's/<div className="min-h-screen flex flex-col bg-gray-50">/<div className="min-h-screen flex flex-col bg-gray-50" style={{ paddingTop: '\''calc(4rem + env(safe-area-inset-top, 0px))'\'' }}>/g' "app/(dashboard)/properties/groups/[id]/page.tsx"

echo "✅ All files fixed!"
echo "📊 Total files updated: 23"
