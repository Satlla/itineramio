#!/bin/bash

echo "🔄 Sistema de Rollback de Itineramio"

# Si no se proporciona versión, mostrar lista
if [ -z "$1" ]; then
    echo "📋 Versiones disponibles:"
    git tag -l "v*" | sort -r | head -10
    echo ""
    echo "Uso: ./scripts/rollback.sh <version>"
    echo "Ejemplo: ./scripts/rollback.sh v2024.01.15.1430"
    exit 1
fi

VERSION=$1

# Verificar que el tag existe
if ! git rev-parse $VERSION >/dev/null 2>&1; then
    echo "❌ La versión $VERSION no existe"
    exit 1
fi

echo "⚠️  Vas a hacer rollback a la versión: $VERSION"
echo "Esto revertirá el código a ese estado."
read -p "¿Estás seguro? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Crear backup del estado actual
    BACKUP_TAG="backup-$(date +%Y%m%d-%H%M%S)"
    git tag $BACKUP_TAG
    echo "💾 Backup creado: $BACKUP_TAG"
    
    # Hacer rollback
    git checkout $VERSION
    git checkout -b rollback-$VERSION
    git checkout main
    git reset --hard $VERSION
    git push origin main --force-with-lease
    
    echo "✅ Rollback completado a $VERSION"
    echo "📌 Si necesitas recuperar el estado anterior: git checkout $BACKUP_TAG"
else
    echo "❌ Rollback cancelado"
fi