#!/bin/bash

echo "🚀 Deploy bypass - compilando y desplegando sin regenerar Prisma..."

# Saltar la regeneración de Prisma y ir directo al build
echo "📦 Building Next.js..."
npm run build:skip-prisma 2>/dev/null || npm run build --skip-prisma 2>/dev/null || {
    echo "⚠️ Usando build normal..."
    npm run build
}

echo "🌐 Desplegando a producción..."
./deploy.sh

echo "✅ Deploy completado!"
echo "🔗 Tu URL debería funcionar ahora: https://www.itineramio.com/guide/cmcqppejj00027cbu1c9c3r6t"