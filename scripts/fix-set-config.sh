#!/bin/bash

# Script to remove all set_config calls that don't work with PgBouncer
# These cause production issues as PgBouncer in transaction mode doesn't support session variables

echo "🔍 Finding and removing set_config calls..."

# Find all TypeScript files with set_config and process them
find app/api -type f -name "*.ts" -exec grep -l "executeRaw.*set_config" {} \; | while read -r file; do
  echo "Processing: $file"

  # Create a backup
  cp "$file" "$file.backup"

  # Replace the set_config line with a comment
  # Pattern: match lines with await prisma.$executeRaw`SELECT set_config...`
  sed -i '' '/await prisma\.\$executeRaw`SELECT set_config/c\
    \/\/ REMOVED: set_config doesn'\''t work with PgBouncer in transaction mode\
    \/\/ RLS is handled at application level instead
' "$file"

  echo "✅ Fixed: $file"
done

echo ""
echo "✨ Done! All set_config calls have been removed."
echo "📋 Backup files created with .backup extension"
echo ""
echo "To verify changes:"
echo "  grep -r 'executeRaw.*set_config' app/api"
echo ""
echo "To remove backups after verification:"
echo "  find app/api -name '*.backup' -delete"
