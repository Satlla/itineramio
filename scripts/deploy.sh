#!/bin/bash

echo "🚀 Preparando deploy a producción..."

# 1. Verificar que estamos en main
BRANCH=$(git branch --show-current)
if [ "$BRANCH" != "main" ]; then
    echo "❌ Debes estar en la rama main para deployar"
    echo "Ejecuta: git checkout main"
    exit 1
fi

# 2. Verificar que no hay cambios sin commitear
if [[ -n $(git status -s) ]]; then
    echo "❌ Hay cambios sin commitear"
    echo "Ejecuta: git add . && git commit -m 'tu mensaje'"
    exit 1
fi

# 3. Ejecutar tests
echo "🧪 Ejecutando tests..."
pnpm type-check
if [ $? -ne 0 ]; then
    echo "❌ Los tests fallaron"
    exit 1
fi

# 4. Crear tag de versión
echo "📌 Creando tag de versión..."
VERSION=$(date +v%Y.%m.%d.%H%M)
git tag -a $VERSION -m "Deploy $VERSION"
echo "✅ Versión creada: $VERSION"

# 5. Push a producción
echo "📤 Subiendo a producción..."
git push origin main --tags

echo "✅ Deploy completado!"
echo "🔄 Si necesitas rollback, ejecuta:"
echo "   ./scripts/rollback.sh $VERSION"