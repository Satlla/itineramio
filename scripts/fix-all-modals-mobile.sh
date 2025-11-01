#!/bin/bash

echo "🔧 Arreglando TODOS los modales para móvil..."

# Encontrar todos los modales
MODALS=$(find src/components -name "*Modal*.tsx" -o -name "*modal*.tsx")

for modal in $MODALS; do
  echo "📱 Procesando: $modal"

  # Backup
  cp "$modal" "$modal.backup"

  # 1. Arreglar max-w-2xl y similares
  sed -i '' 's/max-w-2xl/max-w-[95vw] sm:max-w-xl md:max-w-2xl/g' "$modal"
  sed -i '' 's/max-w-3xl/max-w-[95vw] sm:max-w-2xl md:max-w-3xl/g' "$modal"
  sed -i '' 's/max-w-xl/max-w-[95vw] sm:max-w-lg md:max-w-xl/g' "$modal"
  sed -i '' 's/max-w-lg/max-w-[90vw] sm:max-w-md md:max-w-lg/g' "$modal"
  sed -i '' 's/max-w-md/max-w-[90vw] sm:max-w-sm md:max-w-md/g' "$modal"

  # 2. Arreglar max-height
  sed -i '' 's/max-h-\[90vh\]/max-h-[95vh] sm:max-h-[90vh]/g' "$modal"
  sed -i '' 's/max-h-screen/max-h-[95vh] sm:max-h-screen/g' "$modal"

  # 3. Arreglar padding de modales
  sed -i '' 's/p-8/p-3 sm:p-4 md:p-6 lg:p-8/g' "$modal"
  sed -i '' 's/p-6/p-3 sm:p-4 md:p-6/g' "$modal"
  sed -i '' 's/px-8/px-3 sm:px-4 md:px-6 lg:px-8/g' "$modal"
  sed -i '' 's/px-6/px-3 sm:px-4 md:px-6/g' "$modal"
  sed -i '' 's/py-8/py-3 sm:py-4 md:py-6 lg:py-8/g' "$modal"
  sed -i '' 's/py-6/py-3 sm:py-4 md:py-6/g' "$modal"

  # 4. Arreglar text-3xl y similares para títulos
  sed -i '' 's/text-3xl/text-xl sm:text-2xl md:text-3xl/g' "$modal"
  sed -i '' 's/text-2xl/text-lg sm:text-xl md:text-2xl/g' "$modal"
  sed -i '' 's/text-xl/text-base sm:text-lg md:text-xl/g' "$modal"

  # 5. Arreglar rounded-3xl y similares
  sed -i '' 's/rounded-3xl/rounded-xl sm:rounded-2xl md:rounded-3xl/g' "$modal"
  sed -i '' 's/rounded-2xl/rounded-lg sm:rounded-xl md:rounded-2xl/g' "$modal"

  echo "✅ Arreglado: $modal"
done

echo ""
echo "✨ TODOS los modales han sido optimizados para móvil!"
echo "📋 Backups creados con extensión .backup"
echo ""
echo "Para verificar:"
echo "  git diff src/components"
echo ""
echo "Para eliminar backups:"
echo "  find src/components -name '*.backup' -delete"
